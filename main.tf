data "archive_file" "code_package" {
  type        = "zip"
  source_dir  = "${path.module}/src"
  output_path = "${path.module}/dist/server.zip"
}

output "output_path" {
    value = data.archive_file.code_package.output_path
}