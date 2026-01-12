import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/oauth/Login';
import Register from './pages/oauth/Register';
import DashboardPage from './pages/dashboard/DashboardPage';
import CmsAnalytics from './pages/dashboard/analytics/CmsAnalytics';
import CmsCrudPage from './pages/dashboard/cms_crud/CmsCrudPage';
import NewsLetterPage from './pages/dashboard/news_letter/NewsLetterPage';
import SubscribersPage from './pages/dashboard/subscibers/SubscribersPage';
import CreateBlogPage from './pages/dashboard/cms_crud/create_blog/CreateBlogPage';
import UpdateBlogPage from './pages/dashboard/cms_crud/update_blog/UpdateBlogPage';
import ViewBlogsPage from './pages/dashboard/cms_crud/view_blogs/ViewBlogsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardPage />}>
          {/* Default route redirects to crud-page */}
          <Route index element={<Navigate to="crud-page" replace />} />

          <Route path="crud-page" element={<CmsCrudPage />} >
            <Route path="create-blog" element={<CreateBlogPage/>}/>
            <Route path="update-blog" element={<UpdateBlogPage/>}/>
            <Route path="view-blog" element={<ViewBlogsPage/>}/>
          </Route>

          <Route path="cms-analytics" element={<CmsAnalytics />} />
          <Route path="news-letter" element={<NewsLetterPage />} />
          <Route path="subscribers-page" element={<SubscribersPage />} />
        </Route>
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App