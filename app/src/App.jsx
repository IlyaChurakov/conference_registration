import { Route, Routes } from 'react-router-dom'
import './app.scss'
import ErrorPage from './features/pages/error-page'
import FormikForm from './features/pages/formik'
import Main from './features/pages/main'
import Thanks from './features/pages/thanks'
import ThanksRate from './features/pages/thanks-rate'
import Vote from './features/pages/vote/Vote'
import Feedback from './features/pages/feedback/Feedback'

function App() {
	return (
		<Routes>
			<Route path={'/'} element={<Main />} />
			<Route path={'/vote'} element={<Vote />} />
			<Route path={'/feedback'} element={<Feedback />} />
			<Route path={'/form'} element={<FormikForm />} />
			<Route path={'/thanks/:email/:pdfName'} element={<Thanks />} />
			<Route path={'/thanks-rate'} element={<ThanksRate />} />
			<Route path={'/error/:text'} element={<ErrorPage />} />

			<Route path={'*'} element={<div>Страница не найдена 404</div>} />
		</Routes>
	)
}

export default App
