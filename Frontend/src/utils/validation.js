export const validationSchemas = {
  booking: (data) => {
    const errors = {};
    if (!data.date) errors.date = 'Date is required';
    if (!data.time) errors.time = 'Time is required';
    if (!data.details || data.details.length < 10) errors.details = 'Details must be at least 10 characters';
    return errors;
  },
  feedback: (data) => {
    const errors = {};
    if (!data.rating || data.rating === 0) errors.rating = 'Rating is required';
    if (!data.comment || data.comment.length < 10) errors.comment = 'Comment must be at least 10 characters';
    return errors;
  },
  profile: (data) => {
    const errors = {};
    if (!data.name.trim()) errors.name = 'Name is required';
    if (!data.specialization.trim()) errors.specialization = 'Specialization is required';
    if (!data.bio.trim() || data.bio.length < 20) errors.bio = 'Bio must be at least 20 characters';
    if (!data.location.trim()) errors.location = 'Location is required';
    return errors;
  }
};

export const validateForm = (schema, data) => {
  const errors = schema(data);
  return Object.keys(errors).length === 0;
};

