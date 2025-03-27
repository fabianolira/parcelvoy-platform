
    const dbClient = knex.client.config.client;
    const isMariaDBByClient = dbClient && (dbClient.includes('maria') || dbClient.includes('mariadb'));
    const isMariaDBByEnv = process.env.DB_ENGINE === 'mariadb';
    const isMariaDB = isMariaDBByClient || isMariaDBByEnv;
    
    console.log('DB_ENGINE:', process.env.DB_ENGINE);
    console.log('knex client:', dbClient);
    console.log('Using MariaDB syntax:', isMariaDB);

    if (isMariaDB) {
        await knex.raw(`
            UPDATE journey_steps
            SET data = JSON_SET(data, '$.event_name', JSON_UNQUOTE(JSON_EXTRACT(data, '$.eventName'))),
                data = JSON_REMOVE(data, '$.eventName')
            WHERE \`type\` = 'entrance' AND JSON_UNQUOTE(JSON_EXTRACT(data, '$.trigger')) = 'event'
        `)
    } else {
        await knex.raw(`
            UPDATE journey_steps
            SET data = JSON_SET(data, '$.event_name', data->>'$.eventName'),
                data = JSON_REMOVE(data, '$.eventName')
            WHERE \`type\` = 'entrance' AND data->>'$.trigger' = 'event'
        `)
    }
}

exports.down = async function(knex) {
    const dbClient = knex.client.config.client;
    const isMariaDBByClient = dbClient && (dbClient.includes('maria') || dbClient.includes('mariadb'));
    const isMariaDBByEnv = process.env.DB_ENGINE === 'mariadb';
    const isMariaDB = isMariaDBByClient || isMariaDBByEnv;

    if (isMariaDB) {
        await knex.raw(`
            UPDATE journey_steps
            SET data = JSON_SET(data, '$.eventName', JSON_UNQUOTE(JSON_EXTRACT(data, '$.event_name'))),
                data = JSON_REMOVE(data, '$.event_name')
            WHERE \`type\` = 'entrance' AND JSON_UNQUOTE(JSON_EXTRACT(data, '$.trigger')) = 'event'
        `)
    } else {
        await knex.raw(`
            UPDATE journey_steps
            SET data = JSON_SET(data, '$.eventName', data->>'$.event_name'),
                data = JSON_REMOVE(data, '$.event_name')
            WHERE \`type\` = 'entrance' AND data->>'$.trigger' = 'event'
        `)
    }
}
