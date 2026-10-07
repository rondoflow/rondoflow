export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'chore', 'docs', 'refactor', 'test', 'perf', 'style', 'ci', 'security'
    ]],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
  },
};
