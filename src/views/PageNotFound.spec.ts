import { render } from '@testing-library/vue'
import PageNotFound from './PageNotFound.vue'
import '@testing-library/jest-dom'

test('mount component', async () => {
  expect(PageNotFound).toBeTruthy()

  const { getByText } = render(PageNotFound, {
    global: {
      stubs: {
        'n-layout': {
          template: '<div><slot></slot></div>'
        },
        'n-result': {
          template: '<div><slot name="footer"></slot></div>'
        },
        'router-link': {
          template: '<div><slot></slot></div>'
        },
        'n-button': {
          template: '<div><slot></slot></div>'
        }
      }
    }
  })
  // eslint-disable-next-line testing-library/prefer-screen-queries
  expect(getByText('Find Something Funny')).toBeInTheDocument()
})
