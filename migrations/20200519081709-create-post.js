'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fbid: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.TEXT
      },
      created_time: {
        type: Sequelize.DATE
      },
      full_picture: {
        type: Sequelize.STRING
      },
      comments: {
        type: Sequelize.STRING
      },
      shares: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Posts');
  }
};