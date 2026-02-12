function uuid() {
  var temp_url = URL.createObjectURL(new Blob());
  var uuid = temp_url.toString();
  URL.revokeObjectURL(temp_url);
  const res = uuid.substr(uuid.lastIndexOf("/") + 1);
  return res.replaceAll('-', '')
}

export default uuid