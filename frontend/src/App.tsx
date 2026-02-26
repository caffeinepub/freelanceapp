import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import RoleSelectionPage from './pages/RoleSelectionPage';
import CustomerDashboard from './pages/CustomerDashboard';
import FreelancerDashboard from './pages/FreelancerDashboard';
import CreateJobPage from './pages/CreateJobPage';
import JobDetailsPage from './pages/JobDetailsPage';
import SubmitProposalPage from './pages/SubmitProposalPage';
import ProfileEditPage from './pages/ProfileEditPage';
import FreelancerProfilePage from './pages/FreelancerProfilePage';
import LoginPage from './pages/LoginPage';

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const roleSelectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/role-selection',
  component: RoleSelectionPage,
});

const customerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customer-dashboard',
  component: CustomerDashboard,
});

const createJobRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-job',
  component: CreateJobPage,
});

const jobDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/job/$jobId',
  component: JobDetailsPage,
});

const freelancerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/freelancer-dashboard',
  component: FreelancerDashboard,
});

const submitProposalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/submit-proposal/$jobId',
  component: SubmitProposalPage,
});

const profileEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/edit',
  component: ProfileEditPage,
});

const freelancerProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$userId',
  component: FreelancerProfilePage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  roleSelectionRoute,
  customerDashboardRoute,
  createJobRoute,
  jobDetailsRoute,
  freelancerDashboardRoute,
  submitProposalRoute,
  profileEditRoute,
  freelancerProfileRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
