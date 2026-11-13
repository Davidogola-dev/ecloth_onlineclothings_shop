window.EclothsStore = {
  read(key) {
    const stored = window.localStorage.getItem(`ecloths-${key}`);
    if (stored === null) return [];
    const value = JSON.parse(stored);
    if (!Array.isArray(value)) {
      throw new TypeError(`Saved Ecloths ${key} data must be an array.`);
    }
    return value;
  },
  write(key, value) {
    window.localStorage.setItem(`ecloths-${key}`, JSON.stringify(value));
  }
};

window.EclothsApi = {
  orderEndpoint: "",
  reviewEligibilityEndpoint: "",
  reviewSubmissionEndpoint: ""
};
