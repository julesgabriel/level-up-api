'use strict';
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    fbid: DataTypes.STRING,
    message: DataTypes.TEXT,
    created_time: DataTypes.DATE,
    full_picture: DataTypes.STRING,
    comments: DataTypes.STRING,
    shares: {
      type:DataTypes.INTEGER,
      allowNull : true
    }
  }, {});
  Post.associate = function(models) {
    // associations can be defined here
  };
  return Post;
};