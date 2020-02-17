terraform {}

provider "aws" {
  version = "~> 2.0"
  region  = "eu-west-1"
}

resource "aws_ssm_parameter" "some_namespace_greeting" {
  name  = "/some/namespace/greeting"
  type  = "String"
  value = "Hello, world"
}

resource "aws_ssm_parameter" "foo_bar" {
  name  = "/foo/bar"
  type  = "String"
  value = "bar"
}

resource "aws_ssm_parameter" "foo_secret" {
  name  = "/foo/secret"
  type  = "SecureString"
  value = "somethingsecret"
}

# TODO: Support string list?
