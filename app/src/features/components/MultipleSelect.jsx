import { useField } from 'formik';
import Select from 'react-select';

const MultipleSelect = (props) => {
  const [field, , helpers] = useField(props);

  return (
    <Select
      {...props}
      placeholder="Выбрать"
      isMulti
      className="basic-multi-select"
      classNamePrefix="select"
      onChange={(selectedOptions) =>
        helpers.setValue(selectedOptions.map((opt) => opt.value))
      }
      value={props.options.filter((opt) => field.value.includes(opt.value))}
    />
  );
};

export default MultipleSelect;
