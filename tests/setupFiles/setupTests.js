const Enzyme = require('enzyme')
const EnzymeAdapter = require('@wojtekmaj/enzyme-adapter-react-17')

Enzyme.configure({ adapter: new EnzymeAdapter() })
