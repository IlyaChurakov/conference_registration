import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import * as Yup from 'yup';
import spinner from '../../../icons/oval.svg';
import StarRating from '../../components/star-rating/StarRating';
import Sheet from '../../layouts/sheet';
import styles from './Vote.module.scss';
import { stopWords } from './stopWords';

const Vote = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendForm = async (values) => {
    console.log('Отправка данных');
    setLoading(true);

    const data = {
      ...values,
    };
    console.log(values);
    // Записываем данные в БД
    await fetch(
      `${import.meta.env.VITE_SERVER_PROTOCOL}://${
        import.meta.env.VITE_SERVER_URL
      }:${import.meta.env.VITE_SERVER_PORT}/api/rate`,
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
          setLoading(false);
          navigate(`/thanks-rate`);
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
  };

  const regexPattern = `(^|\\s|[^А-я])(${stopWords.join('|')})(\\s|[^А-я]|$)`;

  const validationSchema = Yup.object({
    industry: Yup.string().required('Поле не должно быть пустым'),
    age: Yup.string().required('Поле не должно быть пустым'),
    post: Yup.string().required('Поле не должно быть пустым'),
    format: Yup.string().required('Поле не должно быть пустым'),
    conferenceFeedback: Yup.string().test(
      'does-not-contain-specific-word',
      'Недопустимые слова',
      (value) => {
        if (!value) return true;
        const regex = new RegExp(regexPattern, 'i');

        return !regex.test(String(value));
      },
    ),
    conferenceFeedbackRating: Yup.number().required('Поставьте оценку'),
    qualityAndRelevance: Yup.string().test(
      'does-not-contain-specific-word',
      'Недопустимые слова',
      (value) => {
        if (!value) return true;
        const regex = new RegExp(regexPattern, 'i');

        return !regex.test(String(value));
      },
    ),
    qualityAndRelevanceRating: Yup.number().required('Поставьте оценку'),
    interestingPresentations: Yup.string()
      .required('Поле не должно быть пустым')
      .test('does-not-contain-specific-word', 'Недопустимые слова', (value) => {
        if (!value) return true;
        const regex = new RegExp(regexPattern, 'i');

        return !regex.test(String(value));
      }),
    inspiringMoments: Yup.string()
      .required('Поле не должно быть пустым')
      .test('does-not-contain-specific-word', 'Недопустимые слова', (value) => {
        if (!value) return true;
        const regex = new RegExp(regexPattern, 'i');

        return !regex.test(String(value));
      }),
    organizationalCommitteeEfforts: Yup.string().test(
      'does-not-contain-specific-word',
      'Недопустимые слова',
      (value) => {
        if (!value) return true;
        const regex = new RegExp(regexPattern, 'i');

        return !regex.test(String(value));
      },
    ),
    organizationalCommitteeEffortsRating:
      Yup.number().required('Поставьте оценку'),
    organizationAspects: Yup.string()
      .required('Поле не должно быть пустым')
      .test('does-not-contain-specific-word', 'Недопустимые слова', (value) => {
        if (!value) return true;
        const regex = new RegExp(regexPattern, 'i');

        return !regex.test(String(value));
      }),
    specificImpressions: Yup.string()
      .required('Поле не должно быть пустым')
      .test('does-not-contain-specific-word', 'Недопустимые слова', (value) => {
        if (!value) return true;
        const regex = new RegExp(regexPattern, 'i');

        return !regex.test(String(value));
      }),
    impactOnDevelopment: Yup.string()
      .required('Поле не должно быть пустым')
      .test('does-not-contain-specific-word', 'Недопустимые слова', (value) => {
        if (!value) return true;
        const regex = new RegExp(regexPattern, 'i');

        return !regex.test(String(value));
      }),
    suggestions: Yup.string()
      .required('Поле не должно быть пустым')
      .test('does-not-contain-specific-word', 'Недопустимые слова', (value) => {
        if (!value) return true;
        const regex = new RegExp(regexPattern, 'i');

        return !regex.test(String(value));
      }),
    other: Yup.string().test(
      'does-not-contain-specific-word',
      'Недопустимые слова',
      (value) => {
        if (!value) return true;
        const regex = new RegExp(regexPattern, 'i');

        return !regex.test(String(value));
      },
    ),
  });

  return (
    <div className={styles.vote}>
      {loading && (
        <div className="loader">
          <ReactSVG src={spinner} />
        </div>
      )}
      <div className={styles.container}>
        <Sheet
          style={{
            height: '100%',
            width: '100%',
            maxWidth: '90%',
          }}
        >
          <Formik
            initialValues={{
              industry: 'Добывающая промышленность',
              age: '18-24',
              post: 'стажер',
              format: 'очно',
              conferenceFeedback: '',
              conferenceFeedbackRating: '',
              qualityAndRelevance: '',
              qualityAndRelevanceRating: '',
              interestingPresentations: '',
              inspiringMoments: '',
              organizationalCommitteeEfforts: '',
              organizationalCommitteeEffortsRating: '',
              organizationAspects: '',
              specificImpressions: '',
              impactOnDevelopment: '',
              suggestions: '',
              other: '',
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              sendForm(values);
            }}
          >
            <Form className={styles.form}>
              <div>
                <h1>ФОРУМ «АО «РТ-ТЕХПРИЕМКА» - 85 ЛЕТ НА СЛУЖБЕ ОТЕЧЕСТВУ»</h1>
                <h2 style={{ textAlign: 'center' }}>
                  Краткая информация об участнике:
                </h2>

                <label htmlFor="format">
                  Укажите форму участия
                  <span style={{ color: 'red' }}>{` *`}</span>
                </label>
                <ErrorMessage
                  name="format"
                  component="div"
                  className="error-message"
                />
                <Field as="select" name="format" className={styles.select}>
                  <option value="очно">Очно</option>
                  <option value="удаленно">Удаленно (ВКС)</option>
                </Field>

                <label htmlFor="industry">
                  Укажите отрасль/область деятельности организации:
                </label>
                <ErrorMessage
                  name="industry"
                  component="div"
                  className="error-message"
                />

                <Field as="select" name="industry" className={styles.select}>
                  <option value="Авиационная промышленность">
                    Авиационная промышленность
                  </option>
                  <option value="Автомобильная промышленность и железнодорожное машиностроение">
                    Автомобильная промышленность и железнодорожное
                    машиностроение
                  </option>

                  <option value="Легкая промышленность">
                    Легкая промышленность
                  </option>
                  <option value="Металлургия и материалы">
                    Металлургия и материалы
                  </option>
                  <option value="Оборонно-промышленный комплекс">
                    Оборонно-промышленный комплекс
                  </option>
                  <option value="Обычные вооружения, боеприпасы и спецхимия">
                    Обычные вооружения, боеприпасы и спецхимия
                  </option>
                  <option value="Радиоэлектронная промышленность">
                    Радиоэлектронная промышленность
                  </option>
                  <option value="Фармацевтическая и медицинская промышленность">
                    Фармацевтическая и медицинская промышленность
                  </option>
                  <option value="Станкостроение и тяжелое машиностроение">
                    Станкостроение и тяжелое машиностроение
                  </option>
                  <option value="Судостроительная промышленность и морская техника">
                    Судостроительная промышленность и морская техника
                  </option>
                  <option value="Химическая промышленность">
                    Химическая промышленность
                  </option>
                  <option value="Другое">Другое</option>
                  {/* Добавьте остальные варианты */}
                </Field>

                <label htmlFor="age">Укажите Ваш возраст:</label>
                <ErrorMessage
                  name="age"
                  component="div"
                  className="error-message"
                />
                <Field as="select" name="age" className={styles.select}>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45-54">45-54</option>
                  <option value="55 и более">55 и более</option>
                  <option value="предпочитаю не указывать">
                    предпочитаю не указывать
                  </option>
                </Field>

                <label htmlFor="post">Категория Вашей должности:</label>
                <ErrorMessage
                  name="post"
                  component="div"
                  className="error-message"
                />
                <Field as="select" name="post" className={styles.select}>
                  <option value="стажер">Стажер</option>
                  <option value="специалист">Специалист</option>
                  <option value="руководитель">Руководитель</option>
                </Field>
              </div>

              <div>
                <h2>Основные вопросы:</h2>

                <label htmlFor="conferenceFeedback">
                  1. Каковы Ваши общие впечатления от Конференции:
                </label>
                <ErrorMessage
                  name="conferenceFeedbackRating"
                  component="div"
                  className="error-message"
                />
                <Field component={StarRating} name="conferenceFeedbackRating" />
                <ErrorMessage
                  name="conferenceFeedback"
                  component="div"
                  className="error-message"
                />
                <Field
                  name="conferenceFeedback"
                  as="textarea"
                  className={styles.textarea}
                />

                <label htmlFor="qualityAndRelevance">
                  2. Каково Ваше мнение о качестве и актуальности тем,
                  затронутых на Конференции?
                </label>
                <ErrorMessage
                  name="qualityAndRelevanceRating"
                  component="div"
                  className="error-message"
                />
                <Field
                  component={StarRating}
                  name="qualityAndRelevanceRating"
                />
                <ErrorMessage
                  name="qualityAndRelevance"
                  component="div"
                  className="error-message"
                />
                <Field
                  name="qualityAndRelevance"
                  as="textarea"
                  className={styles.textarea}
                />

                <label htmlFor="interestingPresentations">
                  3. Какие из презентаций или панельных дискуссий были особенно
                  интересными или информативными для Вас?
                  <span style={{ color: 'red' }}>{` *`}</span>
                </label>
                <ErrorMessage
                  name="interestingPresentations"
                  component="div"
                  className="error-message"
                />
                <Field
                  name="interestingPresentations"
                  as="textarea"
                  className={styles.textarea}
                />

                <label htmlFor="suggestions">
                  4. Предложения по лучшим практикам или темам, которые Вы
                  считаете важными для включения на последующих мероприятиях.
                  <span style={{ color: 'red' }}>{` *`}</span>
                </label>
                <ErrorMessage
                  name="suggestions"
                  component="div"
                  className="error-message"
                />
                <Field
                  name="suggestions"
                  as="textarea"
                  className={styles.textarea}
                />

                <label htmlFor="inspiringMoments">
                  5. Какие моменты Конференции оказались наиболее вдохновляющими
                  или мотивирующими для Вас?
                  <span style={{ color: 'red' }}>{` *`}</span>
                </label>
                <ErrorMessage
                  name="inspiringMoments"
                  component="div"
                  className="error-message"
                />
                <Field
                  name="inspiringMoments"
                  as="textarea"
                  className={styles.textarea}
                />

                <label htmlFor="organizationalCommitteeEfforts">
                  6. Как бы Вы оценили работу организационного комитета и его
                  усилия в создании удобной и стимулирующей атмосферы на
                  Конференции?
                </label>
                <ErrorMessage
                  name="organizationalCommitteeEffortsRating"
                  component="div"
                  className="error-message"
                />
                <Field
                  component={StarRating}
                  name="organizationalCommitteeEffortsRating"
                />
                <ErrorMessage
                  name="organizationalCommitteeEfforts"
                  component="div"
                  className="error-message"
                />
                <Field
                  name="organizationalCommitteeEfforts"
                  as="textarea"
                  className={styles.textarea}
                />

                <label htmlFor="organizationAspects">
                  7. Пожалуйста, укажите, какие аспекты организации Конференции
                  Вам особенно понравились.
                  <span style={{ color: 'red' }}>{` *`}</span>
                </label>
                <ErrorMessage
                  name="organizationAspects"
                  component="div"
                  className="error-message"
                />
                <Field
                  name="organizationAspects"
                  as="textarea"
                  className={styles.textarea}
                />

                <label htmlFor="specificImpressions">
                  8. Можете ли Вы поделиться какими-либо специфическими
                  моментами или впечатлениями, которые вы бы хотели отметить в
                  своем обзоре конференции?
                  <span style={{ color: 'red' }}>{` *`}</span>
                </label>
                <ErrorMessage
                  name="specificImpressions"
                  component="div"
                  className="error-message"
                />
                <Field
                  name="specificImpressions"
                  as="textarea"
                  className={styles.textarea}
                />

                <label htmlFor="impactOnDevelopment">
                  9. Пожалуйста, опишите, какое влияние конференция оказала на
                  Вашу профессиональную сферу и личное развитие.
                  <span style={{ color: 'red' }}>{` *`}</span>
                </label>
                <ErrorMessage
                  name="impactOnDevelopment"
                  component="div"
                  className="error-message"
                />
                <Field
                  name="impactOnDevelopment"
                  as="textarea"
                  className={styles.textarea}
                />

                <label htmlFor="other">
                  10. Предложения по лучшим практикам или темам, которые вы
                  считаете важными для включения.
                </label>
                <ErrorMessage
                  name="other"
                  component="div"
                  className="error-message"
                />
                <Field name="other" as="textarea" className={styles.textarea} />

                <div style={{ marginTop: '10px' }}>
                  <span style={{ color: 'red' }}>*</span> - обязательные для
                  заполнения поля
                </div>
              </div>

              <div>
                <button type="submit" className={styles.submitButton}>
                  Отправить
                </button>
              </div>
            </Form>
          </Formik>
        </Sheet>
      </div>
    </div>
  );
};

export default Vote;
