import React, {FC, ReactElement} from 'react'
import {render, RenderOptions} from '@testing-library/react'

// Create custom render wrapper to give Provider to components that rely on MobX for state management

// const AllTheProviders: FC<{children: React.ReactNode}> = ({children}) => {
//   return (
//     <ThemeProvider theme="light">
//       <TranslationProvider messages={defaultStrings}>
//         {children}
//       </TranslationProvider>
//     </ThemeProvider>
//   )
// }

// const customRender = (
//   ui: ReactElement,
//   options?: Omit<RenderOptions, 'wrapper'>,
// ) => render(ui, {wrapper: AllTheProviders, ...options})

// export * from '@testing-library/react'
// export {customRender as render}