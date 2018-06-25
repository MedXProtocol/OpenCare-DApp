// The react-select <Select /> component uses inline CSS, this fixes it for mobile:
export const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'white',
    borderRadius: '2px',
    border: state.isDisabled ? '2px solid #eeeeee' : state.isFocused ? '2px solid #09ade0' : '2px solid #cccccc',
    boxShadow: state.isFocused ? 'none' : 'none',
    borderColor: state.isDisabled ? '#eeeeee' : state.isFocused ? '#09ade0' : '#cccccc',
    minHeight: '34px',
    maxHeight: '34px'
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isDisabled ? '#eeeeee' : '#cccccc'
  }),
  placeholder: (base, state) => ({
    ...base,
    color: state.isDisabled ? '#eeeeee' : '#888888',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%'
  }),
  multiValue: (base, state) => ({
    ...base,
    maxWidth: '260px',
    whiteSpace: 'inherit'
  })
}
