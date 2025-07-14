import CryptoJS from 'crypto-js';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import * as Yup from 'yup';
import spinner from '../../../icons/oval.svg';
import ContainerLayout from '../../layouts/container-layout';
import Sheet from '../../layouts/sheet';
import './style.scss';
import MultipleSelect from '../../components/MultipleSelect';
import Select from '../../components/select';

const FormikForm = () => {
  function getTime() {
    const currentDate = new Date();

    // Получение текущей даты (год, месяц, день)
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();

    // Получение текущего времени (часы, минуты, секунды)
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();
    const milliseconds = currentDate.getMilliseconds();

    return `${day}-${month}-${year}-${hours}-${minutes}-${seconds}-${milliseconds}`;
  }

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const sendForm = async (values) => {
    console.log('Отправка данных');
    setLoading(true);

    const today = new Date();

    const time = getTime();
    const hash = CryptoJS.SHA256(time).toString(CryptoJS.enc.Hex);

    const data = {
      ...values,
      format: values.format,
      role: values.role,
      theme: values.theme,
      text: hash,
      pdfName: `${values.fio}_${`${today.getDate()}.${
        (today.getMonth() + 1).length == 1
          ? today.getMonth() + 1
          : '0' + (today.getMonth() + 1)
      }.${today.getFullYear()}`}`,
    };

    // Формируем QRcode
    await fetch(
      `${import.meta.env.VITE_SERVER_PROTOCOL}://${
        import.meta.env.VITE_SERVER_URL
      }:${import.meta.env.VITE_SERVER_PORT}/api/qr`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `${import.meta.env.VITE_TOKEN}`,
        },
        body: JSON.stringify(data),
      },
    )
      .then((res) => {
        if (res.status >= 200 && res.status <= 226) {
          console.log('QRcode сформирован');
          return res.text();
        } else {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
      })
      .catch((err) => {
        setLoading(false);
        navigate(`/error/${err ? err : 'Неизвестная ошибка'}`);
        throw new Error(err);
      });

    // Записываем данные в БД
    await fetch(
      `${import.meta.env.VITE_SERVER_PROTOCOL}://${
        import.meta.env.VITE_SERVER_URL
      }:${import.meta.env.VITE_SERVER_PORT}/api/database`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `${import.meta.env.VITE_TOKEN}`,
        },
        body: JSON.stringify(data),
      },
    )
      .then((res) => {
        if (res.status >= 200 && res.status <= 226) {
          console.log('Данные занесены в базу');
          console.log(data);
          return res.text();
        } else {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
      })
      .catch((err) => {
        setLoading(false);
        navigate(`/error/${err ? err : 'Неизвестная ошибка'}`);
        throw new Error(err);
      });

    // Формируем PDF
    await fetch(
      `${import.meta.env.VITE_SERVER_PROTOCOL}://${
        import.meta.env.VITE_SERVER_URL
      }:${import.meta.env.VITE_SERVER_PORT}/api/createPDF`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `${import.meta.env.VITE_TOKEN}`,
        },
        body: JSON.stringify({ ...data, qrcodeTime: hash }),
      },
    )
      .then((res) => {
        if (res.status >= 200 && res.status <= 226) {
          console.log('PDF сформирован');
          return res.text();
        } else {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
      })
      .catch((err) => {
        setLoading(false);
        navigate(`/error/${err ? err : 'Неизвестная ошибка'}`);
        throw new Error(err);
      });

    await fetch(
      `${import.meta.env.VITE_SERVER_PROTOCOL}://${
        import.meta.env.VITE_SERVER_URL
      }:${import.meta.env.VITE_SERVER_PORT}/api/sendemail`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `${import.meta.env.VITE_TOKEN}`,
        },
        body: JSON.stringify(data),
      },
    )
      .then((res) => {
        // Обрабатываем только успешные ответы
        if (res.status >= 200 && res.status <= 226) {
          console.log('Письмо на почту отправлено');
          // Убираем лоадер
          setLoading(false);
          // Перенаправляем на страницу благодарности
          navigate(`/thanks/${data.email}/${data.pdfName}`);
          // Возвращаем текстовый ответ, поскольку приходит тоже текст
          return res.text();
        } else {
          // Выкидываем ошибку с текстом, чтобы отработал блок catch
          throw new Error(`${res.status}: ${res.statusText}`);
        }
      })
      .catch((err) => {
        console.log(err);
        // Также убираем лоадер
        setLoading(false);
        // Перенаправляем на страницу ошибки
        navigate(`/error/${err ? err : 'Неизвестная ошибка'}`);
        // Выкидываем ошибку
        throw new Error(err);
      });
  };

  const validationSchema = Yup.object({
    policy: Yup.string().required('Невозможно продолжить без согласия'),
    forumEvents: Yup.array()
      .of(Yup.string())
      .min(1, 'Выберите минимум одно мероприятие форума')
      .required('Обязательное поле'),
    name: Yup.string().required('Введите название организации'),
    fio: Yup.string()
      .matches(/^[A-Za-zА-Яа-яёЁ\s'-]+$/, 'Недопустимые символы')
      .test(
        'doubleSpaces',
        'Введите полное ФИО',
        (value) => value.split(' ').length >= 2,
      )
      .required('Введите ФИО'),
    email: Yup.string()
      .email('Email должен иметь формат example@mail.ru')
      .required('Введите email'),
    post: Yup.string().required('Введите должность участника'),
    phone: Yup.string()
      .matches(
        /^[0-9() -+]+$/,
        'Допустимые символы номера телефона: 0-9 ( ) - +',
      )
      .required('Введите номер телефона'),
    format: Yup.string().required('Выберите формат участия'),
    role: Yup.string().required('Выберите роль участника'),
  });

  return (
    <div>
      {loading && (
        <div className="loader">
          <ReactSVG src={spinner} />
        </div>
      )}

      <ContainerLayout>
        <div className="links">
          <Link to={'/'}>На главную</Link>
        </div>

        <Sheet>
          <Formik
            initialValues={{
              forumEvents: [],
              name: '',
              incontur: false,
              fio: '',
              post: '',
              phone: '',
              email: '',
              format: '',
              role: '',
              theme: '',
              policy: false,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
              await sendForm(values);
            }}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="form">
                <h1>Заявка</h1>
                <h2>
                  на участие в ФОРУМЕ «АО «РТ-ТЕХПРИЕМКА» - 85 ЛЕТ НА СЛУЖБЕ
                  ОТЕЧЕСТВУ»
                </h2>
                <h3>
                  23 – 26 сентября 2025 года, г. Москва, Бизнес-парк
                  «Ростех-сити»
                </h3>

                <div className="form__input_wrapper">
                  <div>
                    <label htmlFor="forumEvents" className="form__label">
                      Мероприятие Форума
                    </label>
                    <ErrorMessage
                      name="forumEvents"
                      component="div"
                      className="error-message"
                    />
                    <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                      <MultipleSelect
                        name="forumEvents"
                        label="Мероприятие Форума"
                        options={[
                          {
                            value: 'Конференция по качеству',
                            label: 'Конференция по качеству',
                          },
                          {
                            value: 'Конференция по метрологии',
                            label: 'Конференция по метрологии',
                          },
                          {
                            value: 'Совет главных метрологов',
                            label: 'Совет главных метрологов',
                          },
                          {
                            value: 'ИЦК «Метрология и измерительная техника»',
                            label: 'ИЦК «Метрология и измерительная техника»',
                          },
                          {
                            value:
                              'Заседание Рабочей группы трека «Ростех. Качество»',
                            label:
                              'Заседание Рабочей группы трека «Ростех. Качество»',
                          },
                          {
                            value:
                              'Заседание Комитета по развитию систем управления качеством Ассоциации «ЛСОП»',
                            label:
                              'Заседание Комитета по развитию систем управления качеством Ассоциации «ЛСОП»',
                          },
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="name" className="form__label">
                      Наименование организации (полностью)
                    </label>
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="error-message"
                    />
                    <Field
                      id="name"
                      name="name"
                      placeholder="АО РТ-Техприемка"
                      className="form__input"
                    />
                  </div>

                  <div style={{ display: 'flex' }}>
                    <Field
                      id="incontur"
                      name="incontur"
                      className="form__input"
                      type="checkbox"
                      style={{
                        width: '20px',
                        height: '20px',
                        marginLeft: '10px',
                      }}
                    />
                    <label htmlFor="incontur" className="form__label">
                      Входит в контур Государственной корпорации «Ростех»
                    </label>
                  </div>

                  <div>
                    <label htmlFor="fio" className="form__label">
                      Фамилия Имя Отчество (полностью)
                    </label>
                    <ErrorMessage
                      name="fio"
                      component="div"
                      className="error-message"
                    />
                    <Field
                      id="fio"
                      name="fio"
                      placeholder="Иванов Иван Иванович"
                      className="form__input"
                    />
                  </div>

                  <div>
                    <label htmlFor="post" className="form__label">
                      Должность
                    </label>
                    <ErrorMessage
                      name="post"
                      component="div"
                      className="error-message"
                    />
                    <Field
                      id="post"
                      name="post"
                      placeholder="Директор по качеству"
                      type="text"
                      className="form__input"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="form__label">
                      Телефон
                    </label>
                    <ErrorMessage
                      name="phone"
                      component="div"
                      className="error-message"
                    />
                    <Field
                      id="phone"
                      name="phone"
                      placeholder="8XXXXXXXXXX"
                      type="phone"
                      className="form__input"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="form__label">
                      Email
                    </label>
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="error-message"
                    />
                    <Field
                      id="email"
                      name="email"
                      placeholder="example@mail.ru"
                      type="text"
                      className="form__input"
                    />
                  </div>

                  <div>
                    <label htmlFor="format" className="form__label">
                      Формат участия
                    </label>
                    <ErrorMessage
                      name="format"
                      component="div"
                      className="error-message"
                    />
                    <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                      <Select
                        name="format"
                        options={[
                          { value: 'Очно', label: 'Очно' },
                          { value: 'Заочно', label: 'Заочно (ВКС)' },
                        ]}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="role" className="form__label">
                      В качестве
                    </label>
                    <ErrorMessage
                      name="role"
                      component="div"
                      className="error-message"
                    />
                    <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                      <Select
                        name="role"
                        options={[
                          { value: 'Как слушатель', label: 'Как слушатель' },
                          { value: 'С докладом', label: 'С докладом' },
                        ]}
                      />
                    </div>
                  </div>

                  {values.role === 'С докладом' && (
                    <div style={{ gridColumn: '1 / 3' }}>
                      <label htmlFor="theme" className="form__label">
                        Тема доклада
                      </label>
                      <Field
                        id="theme"
                        name="theme"
                        placeholder="..."
                        type="text"
                        className="form__input"
                      />
                    </div>
                  )}
                </div>

                <div
                  className="form__checkbox"
                  style={{ fontSize: '14px', marginTop: '30px' }}
                >
                  <ErrorMessage
                    name="policy"
                    component="div"
                    className="error-message"
                  />
                  <input
                    className="form__checkbox_field"
                    type="checkbox"
                    name="policy"
                    required
                  />
                  <div className="form__checkbox_text">
                    Я ознакомился и согласен с{' '}
                    <a
                      href={`${import.meta.env.VITE_SERVER_PROTOCOL}://${
                        import.meta.env.VITE_SERVER_URL
                      }:${import.meta.env.VITE_SERVER_PORT}/api/fetchPrivacy`}
                      target="_blank"
                    >
                      Политикой Конфиденциальности
                    </a>{' '}
                    и{' '}
                    <a
                      href={`${import.meta.env.VITE_SERVER_PROTOCOL}://${
                        import.meta.env.VITE_SERVER_URL
                      }:${import.meta.env.VITE_SERVER_PORT}/api/fetchAgreement`}
                      target="_blank"
                    >
                      Пользовательским соглашением
                    </a>
                  </div>
                </div>

                <button type="submit" name="button" className="form__submit">
                  Зарегистрироваться
                </button>

                <div
                  style={{
                    marginTop: '10px',
                    fontSize: '12px',
                    textAlign: 'center',
                  }}
                >
                  Контактное лицо по вопросам работы сайта:
                  m.afanasyeva@rt-techpriemka.ru и
                  d.kondratenko@rt-techpriemka.ru
                </div>
              </Form>
            )}
          </Formik>
        </Sheet>
      </ContainerLayout>
    </div>
  );
};

export default FormikForm;
