import React from 'react'
import { screen, render } from '@testing-library/react'
import Feed from '../components/feed/feed'
import useWindowDimensions from '../hooks/useWindowDimensions'

test('render', () => {
    render(<Feed />)
    

    expect(screen.getByText(/new/i)).toBeInTheDocument()
    expect(screen.getByText(/boost/i)).toBeInTheDocument()
    expect(screen.getByText(/comments/i)).toBeInTheDocument()
    expect(screen.getByText(/squash/i)).toBeInTheDocument()
})
