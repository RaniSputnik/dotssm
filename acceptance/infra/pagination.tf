resource "aws_ssm_parameter" "pagination" {
  for_each = {
    foo       = "bar"
    baz       = "barry"
    hello     = "world"
    cake      = "is a lie"
    something = "someone"
    someway   = "somehow"
    tip       = "top"
    gate      = "way"
    rani      = "sputnik"
    project   = "dotssm"
    page      = "2"
  }

  name        = "/pagination/${each.key}"
  description = "Part of the pagination acceptance tests for dotssm"
  type        = "String"
  value       = each.value
}
