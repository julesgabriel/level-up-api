'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    user: DataTypes.STRING,
    token: DataTypes.STRING,
    profile: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};