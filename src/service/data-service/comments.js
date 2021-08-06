'use strict';

// Сервис для работы с комментариями

const {nanoid} = require(`nanoid`);
const {MAX_ID_LENGTH} = require(`../../constants`);

class CommentsService {

  // СОЗДАНИЕ КОММЕНТАРИЯ
  // принимает объявление и текст комментария
  create(offer, comment) {

    // Сначала создаём новый комментарий:
    // генерируем уникальный id с помощью nanoid
    // и переданного текста
    const newComment = Object.assign({
      id: nanoid(MAX_ID_LENGTH),
    }, comment);

    // Пушим новый комментарий в массив
    // комментариев переданного объявления
    offer.comments.push(newComment);

    // возвращаем новый комментарий
    return newComment;
  }

  // УДАЛЕНИЕ КОММЕНТАРИЯ
  // принимает объявление и id удаляемого комментария
  drop(offer, commentId) {

    // Найдём удаляемый комментарий среди
    // массива всех комментариев переданного
    // объявления
    const dropComment = offer.comments.find((comment) => comment.id === commentId);

    // Вернём null, если такого комментария нет
    if (!dropComment) {
      return null;
    }

    // Если есть, то перезапишем массив комментариев без удаляемого
    offer.comments = offer.comments.filter((comment) => comment.id !== commentId);

    // Вернём удалённый комментарий
    return dropComment;
  }

  // ПОЛУЧИТЬ ВСЕ КОММЕНТАРИИ
  findAll(offer) {
    // Просто вернём массив комментариев переданного объявления
    return offer.comments;
  }
}

module.exports = CommentsService;
