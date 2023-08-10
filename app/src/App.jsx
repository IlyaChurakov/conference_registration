import { Route, Routes } from 'react-router-dom'
import './app.scss'
import ErrorPage from './features/pages/error-page'
import Form from './features/pages/form'
import Main from './features/pages/main'
import Thanks from './features/pages/thanks'

function App() {
	return (
		<Routes>
			<Route path={'/'} element={<Main />} />
			<Route path={'/form'} element={<Form />} />
			<Route path={'/thanks/:email/:pdfName'} element={<Thanks />} />
			<Route path={'/error'} element={<ErrorPage />} />

			<Route path={'*'} element={<div>Страница не найдена 404</div>} />
		</Routes>
	)
}

export default App
