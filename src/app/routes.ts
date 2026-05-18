import { createBrowserRouter } from 'react-router';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Projects } from './pages/Projects';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { Playground } from './pages/Playground';
import { Contact } from './pages/Contact';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'about', Component: About },
      { path: 'projects', Component: Projects },
      { path: 'blog', Component: Blog },
      { path: 'blog/:slug', Component: BlogPost },
      { path: 'playground', Component: Playground },
      { path: 'contact', Component: Contact },
      { path: '*', Component: NotFound },
    ],
  },
  {
    path: '/retro',
    lazy: () => import('./pages/retro'),
  },
]);
