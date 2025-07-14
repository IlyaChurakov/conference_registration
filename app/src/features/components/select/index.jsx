import { useField } from 'formik';
import ReactSelect from 'react-select';

const Select = (props) => {
  const [field, , helpers] = useField(props);

  return (
    <ReactSelect
      {...props}
      placeholder="Выбрать"
      className="basic-multi-select"
      classNamePrefix="select"
      onChange={(selectedOption) => helpers.setValue(selectedOption.value)}
      value={props.options.filter((opt) => opt.value === field.value)}
    />
  );
};

export default Select;
