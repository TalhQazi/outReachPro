const applyMergeFields = (template, recipient, fieldMapping) => {
  let emailBody = template;
  Object.keys(fieldMapping).forEach((key) => {
    const placeholder = `{${fieldMapping[key]}}`;
    emailBody = emailBody.replaceAll(placeholder, recipient[key]);
  });
  return emailBody;
};

export default applyMergeFields;
