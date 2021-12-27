export default class OperationDocsStore {
  static getAll() {
    return `query MyQuery {
  students {
    name
    id
    teacher_id
  }
}`;
  }

  static addOne(name) {
    return `mutation MyMutation {
  insert_students(objects: {name: "${name}"}) {
    returning {
      id
      name
      teacher_id
    }
  }
}
`;
  }

  static deleteByName(name) {
    return `mutation MyMutation {
  delete_students(where: {name: {_eq: "${name}"}}) {
    affected_rows
  }
}
`;
  }
}
