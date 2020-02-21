---
title: Simple Usage
order: 1
---

本 Demo 演示一行文字的用法。

````jsx
import Validate from '@alifd/validate';

const schema = new Validate({
  name: [
    {
        required: true,
        aliasName: '用户名'
    },
  ],
});

schema.validate(
    {
        name: '',
    },
    errors => {
      console.log(errors)
    }
);
````
