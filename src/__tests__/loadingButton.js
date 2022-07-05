import React from 'react'
import { screen, render, rerender } from '@testing-library/react'
import LoadingButton from '../components/loadingButton/loadingButton'

test('loadingButton renders and props render conditionally', () => {
    render(<LoadingButton isLoading={false} name={"string"} />)
    screen.debug()
    expect(screen.getByText(/string/i)).toBeInTheDocument()
    
    render(<LoadingButton isLoading={true} name={"name"} />)
    screen.debug()
    expect(screen.getByText(/name/i)).toBeInTheDocument()
})
