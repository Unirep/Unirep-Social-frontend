import React from 'react'
import { screen, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Feed from '../components/feed/feed'

const setFeedChoiceMock = jest.fn();


test('should render all of the QueryTypes in the Feed', () => {
    render(<Feed />)
    
    expect(screen.getByText(/new/i)).toBeInTheDocument()
    expect(screen.getByText(/boost/i)).toBeInTheDocument()
    expect(screen.getByText(/comments/i)).toBeInTheDocument()
    expect(screen.getByText(/squash/i)).toBeInTheDocument()

    // screen.debug()
})


test('calls callback correctly with jest mock function', () => {
    render(<Feed feedChoice={"new"} setFeedChoice={setFeedChoiceMock} />)

    // click on whatever makes the drop down open
    userEvent.click(screen.getByText(/new/i));
    screen.debug()
    // click on one option
    // userEvent.click(screen.getByText(/new/i));

    // check that the callback was called
    expect(setFeedChoiceMock).toHaveBeenCalledWith("new");
});

// write other tests changing the feedChoice props to ensure all cases work well
test('respects feedChoice props of "boost"', () => {
    render(<Feed feedChoice="boost" setFeedChoice={setFeedChoiceMock} />)
    
    // check that feedChoice is correctly used
    expect(screen.getByText(/boost/i)).toBeInTheDocument()
});
