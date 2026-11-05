import { RouterProvider } from 'react-router'

import {ACTIVE_THEME} from '../styles/theme'
import '../styles/shared.css'

import {router} from './router'

function App() {
    return (
        <div className="app" data-theme={ACTIVE_THEME}>
            <RouterProvider router={router} />
        </div>
    )
}

export default App