import 'react'
import ReactDOM from 'react-dom'
import AppRouter from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles.scss'
import './context/EpochManager'

ReactDOM.render(<AppRouter />, document.getElementById('root'))
