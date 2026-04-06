require('dotenv').config();
const neo4j = require('neo4j-driver');

const required = [
  'SOURCE_NEO4J_URI',
  'SOURCE_NEO4J_USER',
  'SOURCE_NEO4J_PASSWORD',
  'TARGET_NEO4J_URI',
  'TARGET_NEO4J_USER',
  'TARGET_NEO4J_PASSWORD'
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing env var: ${key}`);
    process.exit(1);
  }
}

const toNativeInt = (value) => {
  if (neo4j.isInt(value)) {
    return value.toNumber();
  }
  return value;
};

const escapeIdentifier = (value) => String(value).replace(/`/g, '``');

const sourceDriver = neo4j.driver(
  process.env.SOURCE_NEO4J_URI,
  neo4j.auth.basic(process.env.SOURCE_NEO4J_USER, process.env.SOURCE_NEO4J_PASSWORD)
);

const targetDriver = neo4j.driver(
  process.env.TARGET_NEO4J_URI,
  neo4j.auth.basic(process.env.TARGET_NEO4J_USER, process.env.TARGET_NEO4J_PASSWORD)
);

async function run() {
  const sourceSession = sourceDriver.session();
  const targetSession = targetDriver.session();

  try {
    console.log('Checking source/target connectivity...');
    await sourceSession.run('RETURN 1 AS ok');
    await targetSession.run('RETURN 1 AS ok');

    if (String(process.env.MIGRATION_OVERWRITE || 'false').toLowerCase() === 'true') {
      console.log('Clearing target database...');
      await targetSession.run('MATCH (n) DETACH DELETE n');
    }

    console.log('Reading nodes from source...');
    const nodesResult = await sourceSession.run(
      'MATCH (n) RETURN id(n) AS id, labels(n) AS labels, properties(n) AS props'
    );

    console.log('Creating nodes in target...');
    for (const record of nodesResult.records) {
      const sourceId = toNativeInt(record.get('id'));
      const labels = record.get('labels');
      const props = record.get('props') || {};

      const labelString = labels.length
        ? labels.map((l) => `\`${escapeIdentifier(l)}\``).join(':')
        : '';

      const query = labelString
        ? `CREATE (n:${labelString}) SET n = $props, n._sourceId = $sourceId`
        : 'CREATE (n) SET n = $props, n._sourceId = $sourceId';

      await targetSession.run(query, {
        props,
        sourceId
      });
    }

    console.log('Reading relationships from source...');
    const relsResult = await sourceSession.run(
      'MATCH (a)-[r]->(b) RETURN id(a) AS fromId, id(b) AS toId, type(r) AS type, properties(r) AS props'
    );

    console.log('Creating relationships in target...');
    for (const record of relsResult.records) {
      const fromId = toNativeInt(record.get('fromId'));
      const toId = toNativeInt(record.get('toId'));
      const type = record.get('type');
      const props = record.get('props') || {};

      const relType = `\`${escapeIdentifier(type)}\``;
      const query = `
        MATCH (a {_sourceId: $fromId}), (b {_sourceId: $toId})
        CREATE (a)-[r:${relType}]->(b)
        SET r = $props
      `;

      await targetSession.run(query, { fromId, toId, props });
    }

    console.log('Cleaning migration helper properties...');
    await targetSession.run('MATCH (n) REMOVE n._sourceId');

    const countResult = await targetSession.run(
      'MATCH (n) WITH count(n) AS nodes MATCH ()-[r]->() RETURN nodes, count(r) AS rels'
    );

    const counts = countResult.records[0];
    console.log(`Migration complete. Nodes: ${toNativeInt(counts.get('nodes'))}, Relationships: ${toNativeInt(counts.get('rels'))}`);
  } finally {
    await sourceSession.close();
    await targetSession.close();
    await sourceDriver.close();
    await targetDriver.close();
  }
}

run().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
