import { render } from '@testing-library/vue'
import HelloWorld from './HelloWorld.vue'

test('mount component', async () => {
  expect(HelloWorld).toBeTruthy()

  const { container } = render(HelloWorld, {
    props: {
      msg: 'Hello world'
    }
  })

  expect(container.textContent).toContain('Hello world')
  // expect(wrapper.html()).toMatchSnapshot()

  // await wrapper.get('button').trigger('click')

  // expect(wrapper.text()).toContain('4 x 3 = 12')

  // await wrapper.get('button').trigger('click')

  // expect(wrapper.text()).toContain('4 x 4 = 16')
})
