import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type UserId = Principal;
  type JobId = Nat;
  type Category = Text;

  type AppRole = {
    #customer;
    #freelancer;
  };

  type UserProfile = {
    displayName : Text;
    bio : Text;
    skills : [Text];
    hourlyRate : Nat;
    appRole : AppRole;
    resume : ?Storage.ExternalBlob;
  };

  type Job = {
    id : JobId;
    title : Text;
    description : Text;
    budget : Nat;
    category : Category;
    customer : UserId;
    isOpen : Bool;
  };

  type Proposal = {
    jobId : JobId;
    freelancer : UserId;
    coverLetter : Text;
    proposedPrice : Nat;
  };

  let userProfiles = Map.empty<UserId, UserProfile>();
  let jobs = Map.empty<JobId, Job>();
  let proposals = Map.empty<JobId, List.List<Proposal>>();

  var nextJobId : Nat = 0;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func chooseRole(isFreelancer : Bool) : async () {
    let currentRole = AccessControl.getUserRole(accessControlState, caller);
    if (currentRole != #guest) {
      Runtime.trap("Role already chosen");
    };

    AccessControl.assignRole(accessControlState, caller, caller, #user);

    let appRole : AppRole = if (isFreelancer) { #freelancer } else { #customer };

    let profile : UserProfile = {
      displayName = "";
      bio = "";
      skills = [];
      hourlyRate = 0;
      appRole;
      resume = null;
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createJob(
    title : Text,
    description : Text,
    budget : Nat,
    category : Category,
  ) : async JobId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can create jobs");
    };
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.appRole != #customer) {
          Runtime.trap("Unauthorized: Only customers can create jobs");
        };
      };
      case (null) { Runtime.trap("User profile not found") };
    };

    let jobId = nextJobId;
    let job : Job = {
      id = jobId;
      title;
      description;
      budget;
      category;
      customer = caller;
      isOpen = true;
    };

    jobs.add(jobId, job);
    proposals.add(jobId, List.empty<Proposal>());
    nextJobId += 1;
    jobId;
  };

  public query ({ caller }) func getMyJobs() : async [Job] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their jobs");
    };
    let allJobs = jobs.values().toArray();
    allJobs.filter(func(j : Job) : Bool { j.customer == caller });
  };

  public query ({ caller }) func getProposalsForJob(jobId : JobId) : async [Proposal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view proposals");
    };
    let job = switch (jobs.get(jobId)) {
      case (?j) { j };
      case (null) { Runtime.trap("Job does not exist") };
    };
    if (job.customer != caller) {
      Runtime.trap("Unauthorized: Only the job owner can view proposals");
    };
    let propList = switch (proposals.get(jobId)) {
      case (?props) { props };
      case (null) { List.empty<Proposal>() };
    };
    propList.toArray();
  };

  public shared ({ caller }) func acceptProposal(
    jobId : JobId,
    freelancerId : UserId,
  ) : async Proposal {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can accept proposals");
    };

    let job = switch (jobs.get(jobId)) {
      case (?j) { j };
      case (null) { Runtime.trap("Job does not exist") };
    };

    if (job.customer != caller) {
      Runtime.trap("Unauthorized: Only the job owner can accept proposals");
    };

    if (not job.isOpen) {
      Runtime.trap("Job is already closed");
    };

    let propList = switch (proposals.get(jobId)) {
      case (?props) { props };
      case (null) { Runtime.trap("No proposals found for this job") };
    };

    let found = propList.find(func(p : Proposal) : Bool {
      p.freelancer == freelancerId
    });

    switch (found) {
      case (?proposal) {
        jobs.add(jobId, { job with isOpen = false });
        proposal;
      };
      case (null) { Runtime.trap("Proposal from this freelancer not found") };
    };
  };

  public query func getAllOpenJobs() : async [Job] {
    let allJobs = jobs.values().toArray();
    allJobs.filter(func(j : Job) : Bool { j.isOpen });
  };

  public query func getOpenJobsByCategory(category : Category) : async [Job] {
    let allJobs = jobs.values().toArray();
    allJobs.filter(
      func(j : Job) : Bool { j.isOpen and j.category == category },
    );
  };

  public shared ({ caller }) func submitProposal(
    jobId : JobId,
    coverLetter : Text,
    proposedPrice : Nat,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can submit proposals");
    };
    switch (userProfiles.get(caller)) {
      case (?profile) {
        if (profile.appRole != #freelancer) {
          Runtime.trap("Unauthorized: Only freelancers can submit proposals");
        };
      };
      case (null) { Runtime.trap("User profile not found") };
    };

    let job = switch (jobs.get(jobId)) {
      case (?j) { j };
      case (null) { Runtime.trap("Job does not exist") };
    };

    if (not job.isOpen) {
      Runtime.trap("Cannot submit proposal to a closed job");
    };

    if (job.customer == caller) {
      Runtime.trap("Cannot submit proposal to your own job");
    };

    let proposal : Proposal = {
      jobId;
      freelancer = caller;
      coverLetter;
      proposedPrice;
    };

    let existingProposals = switch (proposals.get(jobId)) {
      case (?props) { props };
      case (null) { List.empty<Proposal>() };
    };

    existingProposals.add(proposal);
    proposals.add(jobId, existingProposals);
  };

  public query ({ caller }) func getMyProposals() : async [Proposal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their proposals");
    };
    var result = List.empty<Proposal>();
    for ((_, propList) in proposals.entries()) {
      let mine = propList.filter(func(p : Proposal) : Bool {
        p.freelancer == caller
      });
      let mineArray = mine.toArray();
      let mineList = List.fromArray<Proposal>(mineArray);
      result.addAll(mineList.values());
    };
    result.toArray();
  };

  public shared ({ caller }) func updateMyProfile(
    displayName : Text,
    bio : Text,
    skills : [Text],
    hourlyRate : Nat,
    resume : ?Storage.ExternalBlob,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update their profile");
    };
    let existing = switch (userProfiles.get(caller)) {
      case (?p) { p };
      case (null) { Runtime.trap("User profile not found; please choose a role first") };
    };
    userProfiles.add(
      caller,
      {
        existing with
        displayName;
        bio;
        skills;
        hourlyRate;
        resume;
      },
    );
  };

  public query func getPublicProfile(userId : UserId) : async ?UserProfile {
    userProfiles.get(userId);
  };

  public query func getJobsByCustomer(customerId : UserId) : async [Job] {
    let allJobs = jobs.values().toArray();
    allJobs.filter(func(j : Job) : Bool { j.customer == customerId });
  };

  public query func downloadResume(userId : UserId) : async ?Storage.ExternalBlob {
    switch (userProfiles.get(userId)) {
      case (?profile) { profile.resume };
      case (null) { null };
    };
  };
};
