import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {Router} from 'react-router-dom'
import AppRouter from '../router'



test('AppRouter renders all routes and I can navigate to those pages', () => {
    render(<AppRouter />)
    screen.debug()
})