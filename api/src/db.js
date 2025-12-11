export function prepareQuery(sql, params = []) {
  return async (env) => {
    // env.DB is D1 binding name
    const r = await env.DB.prepare(sql).bind(...params).all();
    return r;
  }
}
