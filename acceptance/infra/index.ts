import * as aws from "@pulumi/aws";

const params = {
  "/some/namespace/greeting": "Hello, world",

  "/foo/bar": "bar",
  "/foo/secret": "somethingsecret",
  "/foo/nested/value": "this config is nested",

  "/pagination/foo": "bar",
  "/pagination/baz": "barry",
  "/pagination/hello": "world",
  "/pagination/cake": "is a lie",
  "/pagination/something": "someone",
  "/pagination/someway": "somehow",
  "/pagination/tip": "top",
  "/pagination/gate": "way",
  "/pagination/rani": "sputnik",
  "/pagination/project": "dotssm",
  "/pagination/page": "2"
};

Object.entries(params).map(
  ([name, value]) =>
    new aws.ssm.Parameter(name, {
      name: name,
      description: "Fixture for dotssm acceptance tests",
      type: "String",
      value: value,
      overwrite: true
    })
);
