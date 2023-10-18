import './css/App.css';
import 'video.js/dist/video-js.css';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'react-bootstrap'


import Home from "./page/Home"
import LoginPage from "./page/LoginPage"
import RegisterPage from "./page/RegisterPage" 
import ProfilePage from './page/profilePage';
import AdminPage from './page/AdminPage';
import UploadPage from './page/uploadPage';
import NotFoundPage from './page/notfoundPage';
import WatchPage from './page/WatchPage';
import TokenExpirePage from './page/tokenExpirePage';
import HistoryPage from './page/HistoryPage';
import TagPage from './page/tagPage';
import SearchPage from './page/searchPage';
import UserVideos from './page/VideoPage'
import VideoStatusPage from './page/PageStatus';
import UserListPage from './page/userslist';
import VideosListPage from './page/videoslist';

import {isSessionSet} from './components/session';
import AdminAPI from './page/AdminAPI';
import AdminTag from './page/AdminTag';
import AdminLog from './page/AdminLog';
import Monitor from './page/Monitor';
import UsersStorage from './page/UsersStorage';
import SettingPage from './page/settingPage';
import UserLog from './page/UserLogPage';
import UserReport from './page/UserReportPage';
import UserAPI from './page/UserAPI';
import UserStats from './page/StatisticsVid';
import AdminVideoLog from './page/AdminVideoLog';

function App() {
	if(isSessionSet('session') && isSessionSet('isLoggedIn')) {
		
		return (
			<Router>
				<Routes>
					
					{/* login/register page */}
					<Route path='/login' element={<LoginPage />} />
					<Route path='/register' element={<RegisterPage />} />
	
					{/* main page */}
					<Route path="/" element={<Home />} />
					<Route path='/profile' element={<ProfilePage />} />
					<Route path='/upload' element={<UploadPage />} />
					<Route path='/admin' element={<AdminPage />} />
					<Route path='/watch' element={<WatchPage />} />
					<Route path='/token-expired' element={<TokenExpirePage />} />
					<Route path='/history' element={<HistoryPage />} />
					<Route path='/setting' element={<SettingPage/>} />
					<Route path='/tag' element={<TagPage />} />
					<Route path='/search' element={<SearchPage />} />
					<Route path='/videos' element={<UserVideos/>} />
					<Route path='/videosStatus' element={<VideoStatusPage/>} />
					<Route path='/log' element={<UserLog/>} />
					<Route path='/stats' element={<UserStats/>} />
					<Route path='/report' element={<UserReport/>} />
					<Route path='/api' element={<UserAPI/>} />
					<Route path='/admin/users' element={<UserListPage/>} />
					<Route path='/admin/videos' element={<VideosListPage/>} />
					<Route path='/admin/api' element={<AdminAPI/>} />
					<Route path='/admin/tag' element={<AdminTag/>} />
					<Route path='/admin/uploadLog' element={<AdminVideoLog/>} />
					<Route path='/admin/userLog' element={<AdminLog/>} />
					<Route path='/admin/monitor' element={<Monitor/>} />
					<Route path='/admin/storage' element={<UsersStorage/>} />
					{/* not found page */}
					<Route path='*' element={<NotFoundPage />} />	
				</Routes>
			</Router>
		);
	} else {
		return(
			<Router>
				<Routes>
					{/* login/register page */}
					<Route path='/login' element={<LoginPage />} />
					<Route path='/register' element={<RegisterPage />} />
	
					{/* main page */}
					<Route path="/" element={<Home />} />
					<Route path='/profile' element={<ProfilePage />} />
					<Route path='/watch' element={<WatchPage />} />
					<Route path='/token-expired' element={<TokenExpirePage />} />
					<Route path='/tag' element={<TagPage />} />
					<Route path='/search' element={<SearchPage />} />
				
					{/* not found page */}
					<Route path='*' element={<NotFoundPage />} />
				</Routes>
			</Router>
		)
	}

	
}

export default App;
