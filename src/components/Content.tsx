import { CONTENT_TEXT } from '../constants';

export const Content = () => {
  return (
    <main>
      <article className="content">
        <p>
          {CONTENT_TEXT.MAIN_CONTENT}
        </p>
      </article>
    </main>
  );
};