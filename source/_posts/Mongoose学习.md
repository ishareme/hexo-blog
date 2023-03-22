---
title: Mongoose学习
tags:
  - Mongoose
categories:
  - 学习笔记
abbrlink: 59470b8
date: 2018-08-18 22:53:01
---

## 何为 Mongoose？

简单的说，Mongoose 就是对 node 环境中 MongoDB 数据库操作的封装，一个对象模型工具，将数据库中的数据转换为 JavaScript 对象以供我们在应用中使用。

## Schema、Model、Entity

在使用 Mongoose 前，先了解一下 Mongoose 中的三个概念：Schema、Model、Entity

### Schema

`Schema`是一种以文件形式存储的数据库模型骨架，不具备数据库的操作能力，其实也可以看作是表结构的定义。

如何创建一个 Schema？

```node
const UserSchema = new Schema({
	token: String,
	is_banned: { type: Boolean, default: false }, //是否禁言
	enable: { type: Boolean, default: true }, //用户是否有效
	is_actived: { type: Boolean, default: false }, //邮件激活
	username: String,
	password: String,
	email: String, //email唯一性
	code: String,
	email_time: { type: Date },
	phone: { type: String },
	description: { type: String, default: '这个人很懒，什么都没有留下...' },
	avatar: { type: String, default: 'http://p89inamdb.bkt.clouddn.com/default_avatar.png' },
	bg_url: { type: String, default: 'http://p89inamdb.bkt.clouddn.com/FkagpurBWZjB98lDrpSrCL8zeaTU' },
	ip: String,
	ip_location: { type: Object },
	agent: { type: String }, // 用户ua
	last_login_time: { type: Date },
	openid: {
		WeiChat: String,
		WeiBo: String,
		QQ: String,
	},
	create_time: { type: Date },
	// retrieve_time: { type: Number }, // 用户发送激活请求的时间
	image_article: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ImageArticle' }],
	collection_image_article: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ImageArticle' }],
	collection_reading_article: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReadingArticle' }],
	collection_music_article: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MusicArticle' }],
	collection_film_article: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FilmArticle' }],
	collection_sound_article: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SoundArticle' }],
	following_user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], //关注
	follower_user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], //粉丝
});
```

### Model

由 Schema 发布生成的模型，具有抽象属性和行为的数据库操作对象。正是 Model 的存在，让我们操作数据库更加方便快捷。
依赖`Schema`生成一个`Model`：

```node
const User = mongoose.model('User', UserSchema);
module.exports = User;
```

### Entity

由 Model 创建的实体，它的操作也会影响数据库。
依赖`Model`，创造一个`Entity`：

```node
const UserModel = require('../../models/user/user');
const newUser = new UserModel({
	username: '就这样子吧',
	password: sha1('xxx'),
	token: createToken('就这样子吧'),
	email: '651734877@qq.com',
	phone: '13003919397',
	agent: req.headers['user-agent'],
	ip: ip,
	ip_location: geoip.lookup(ip),
});
```

## CRUD

```node
exports.get = (req, res) => {
	const articleId = req.query['id'];
	ArticlesModel.findById(articleId, (err, result) => {
		if (err) {
			return res.status(400).send({
				message: '查找失败',
				data: [],
			});
		} else {
			res.jsonp({
				data: [result],
			});
		}
	});
};

exports.add = (req, res) => {
	const article = new ArticlesModel(req.body);
	article.save(err => {
		if (err) {
			return res.status(400).send({
				message: '新增失败',
				data: [],
			});
		} else {
			res.send({
				data: [article],
			});
		}
	});
};

exports.remove = (req, res) => {
	const id = req.query['id'];

	ArticlesModel.remove({ _id: id }, err => {
		if (err) {
			return res.status(400).send({
				message: '删除失败',
				data: [],
			});
		} else {
			res.send({ status: 1 });
		}
	});
};

exports.update = (req, res) => {
	const id = req.body['id'];
	ArticlesModel.findById(id, (err, result) => {
		if (err) {
			return res.send({
				message: '更新失败',
				data: [],
			});
		} else {
			delete req.body['id'];
			const articles = _.extend(result, req.body);
			articles.save((err, result) => {
				if (err) {
					return res.status(400).send({
						message: '更新失败',
						data: [],
					});
				} else {
					res.jsonp({ data: [articles] });
				}
			});
		}
	});
};
```

## 索引

索引可以加快查询速度，我们通过一个例子来看看效果。
在 mongo Shell 中，我们创建 10000 条数据：

```node
$ mongo

for (var i = 0; i < 10000; i++){
    db.users.insert({'name':'user' + i});
}
```

![image](http://oubl6fzsm.bkt.clouddn.com/mongoose-explain.jpg)
图中可以看出`executionTimeMillis`字段为 7， 表示知晓时间为 7 毫秒。
现在我们来添加索引后执行查询：

```
db.hello.ensureIndex({name: 1});
db.hello.find({'name': 'user1000'}).explain('executionStats')
```

![image](http://oubl6fzsm.bkt.clouddn.com/mongoose-explain2.jpg)
图中可以看出`executionTimeMillis`字段为 1。

从上面的实例可以看出，加了索引后，能快速的查询一条，这可以看到索引极大的提升了查询速度。

下面我们看看如何使用 Mongoose 创建：

```
const ArticlesSchema = new Schema({
  username: {
    ...
    index: true
  }
});
```

**注**: 对于添加的每一条索引，每次写操作（插入、更新、删除）都将耗费更多的时间。这是因为，当数据发生变化时，不仅要更新文档，还要更新集合上的所有索引。因此，mongodb 限制每个集合最多有 64 个索引。通常，在一个特定的集合上，不应该拥有两个以上的索引。

## 验证器 Validate

### 内置验证器

Mongoose 提供了几个内置验证器。

-   所有的 SchemaType 都有内置的 require 验证器。
-   数值（ Numbers ）有最大（man）和最小（min）的验证器。
-   字符串（String）有 enum，maxLength 和 minLength 验证器。

```
const UsersSchema = new Schema({
  ...
  age: {
    type: Number,
    min: [18, "自定义错误提示"]
    max: 30,
    required: true
  },
  sex: {
    type: String,
    enum: {
      values: ['male', 'female'],
      message: '`{PATH}` 是 `{VALUE}`， 您必须确认您的性别!'
    },
    required: true
  }
});

mongoose.model('users', UsersSchema);
```

### 自定义验证器

```
const UsersSchema = new Schema({
  ...
  phone: {
    type: String,
    validate: {
      validator: function (v) {
          return /1[3|5|8]\d{9}/.test(v);
      },
      message: '`{PATH}` 必须是有效的11位手机号码!'
    },
    required: true
  }
});

或者

UsersSchema.path('phone').validate(function (v) {
    return /1[3|5|8]\d{9}/.test(v);
}, '`{PATH}` 必须是有效的11位手机号码!');
```

### 错误提示

```
const user = new UsersModel(req.body);

user.save((err, result) => {
  if (err) {
    console.error(err.errors['name']['message']);
    return res.status(400)
      .send({
        message: err
       });
  } else {
    res.jsonp(user);
  }
})
```

## 联表查询

如果你使用过 MySql，肯定用过 join，用来联表查询，但 Mongoose 中并没有 join，不过它提供了一种更方便快捷的方法：`Population`。
用简短的话来概括 Population 的使用：在一个 Collection(articles)中定义一个指向另一个 Collection(comment)的\_id 字段的字段(comment)

```
//FilmComment
const filmCommentSchema = new Schema({
    ...
    article_id: {type: mongoose.Schema.Types.ObjectId, ref: 'FilmArticle', required: true},
    ...
    reply_to_id: {type: mongoose.Schema.Types.ObjectId, ref: 'FilmComment'}   //ref的值是模型(model)名称 //被回复的评论id
    ...
})
const FilmComment = mongoose.model('FilmComment', filmCommentSchema);
module.exports = FilmComment

//FilmArticle
const filmArticleSchema = new Schema({
    ...
    comment: [{type: mongoose.Schema.Types.ObjectId, ref: 'FilmComment'}],
    ...
})
let FilmArticle = mongoose.model('FilmArticle', filmArticleSchema);
module.exports = FilmArticle

const newFilmComment = req.body.reply_to_id ? new FilmCommentModel({
    article_id: req.body.article_id,
    content: content,
    create_time: Date.now(),
    reply_to_id: req.body.reply_to_id
}) : new FilmCommentModel({
    article_id: req.body.article_id,
    content: content,
    create_time: Date.now(),
})

await FilmCommentModel.create(newFilmComment)
const newFilmArticle = await FilmArticleModel.findByIdAndUpdate(req.body.article_id, {
    $push': {
        comment: newFilmComment._id
    },
}, {new: true}).populate({
    path: 'comment',
    model: 'FilmComment',
    populate: {
        path: 'reply_to_id',
        model: 'FilmComment',
        populate: {
            path: 'user_id',
            select: {
                password: 0, token: 0
            },
            model: 'User'
        }
    }
})
```

## 虚拟属性 VirtualType

虚拟属性并不会存储到 MongoDB 中，利用它，我们可以格式化和自定义组合属性值。

```
const UsersSchema = new Schema({
  ...
  address: {
    city: {type: String},
    street: {type: String}
  }
});
const address = UsersSchema.virtual('address.full');

address.get(function () {
  return this.address.city + ' ' + this.address.street;
});
```

## 插件

我们是可以通过插件形式来拓展 Schema 的功能。

比如文章，当我们修改文章时，一般都会添加一个最后编辑时间，虽然我们可以每次修改时都手动更新，但是我们可以通过插件来自动更新。

```
// plugins/plugins.js
module.exports = {
  lastModified(schema) {
    schema.add({ lastMod: Date })
    schema.pre('save', function (next) {    //前置钩子
      this.lastMod = new Date;
      next()
    })
  }
}


// articles/filmArticles.js

const plugins = require('../plugins/plugins');

filmArticlesSchema.plugin(plugins.lastModified);
```

## 聚合函数

MongoDB 中聚合(aggregate)主要用于处理数据(诸如统计平均值,求和等)，并返回计算后的数据结果。有点类似 sql 语句中的 count(\*)。
