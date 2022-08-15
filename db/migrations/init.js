exports.up = function(knex) {
    return knex.schema
        .createTable('projects', function(table) {
            table.increments()
            table.string('name', 255).defaultTo('')
            table.string('description', 2048).defaultTo('')
            table.timestamp('created_at').defaultTo(knex.fn.now())
            table.timestamp('updated_at').defaultTo(knex.fn.now())
            table.timestamp('deleted_at').nullable()
            table.unique('name')
        })
        .createTable('admins', function(table) {
            table.increments()
            table.string('first_name', 255).notNullable()
            table.string('last_name', 255).notNullable()
            table.string('email', 255).notNullable()
            table.timestamp('created_at').defaultTo(knex.fn.now())
            table.timestamp('updated_at').defaultTo(knex.fn.now())
            table.timestamp('deleted_at').nullable();
        })
        .createTable('project_admins', function(table) {
            table.increments()
            table.integer('project_id').unsigned().notNullable()
            table.integer('admin_id').unsigned().notNullable()
            table.timestamp('created_at').defaultTo(knex.fn.now())
            table.timestamp('deleted_at').nullable()
            table.foreign('project_id').references('projects.id')
            table.foreign('admin_id').references('admins.id')
        })
        .createTable('users', function(table) {
            table.increments()
            table.integer('project_id').unsigned().notNullable()
            table.string('external_id', 255).notNullable()
            table.string('email', 255).nullable()
            table.string('phone', 64).nullable()
            table.json('data').notNullable()
            table.timestamp('created_at').defaultTo(knex.fn.now())
            table.timestamp('updated_at').defaultTo(knex.fn.now())
            table.unique(['project_id', 'external_id'])
            table.foreign('project_id').references('projects.id')
        })
        .createTable('devices', function(table) {
            table.increments()
            table.integer('user_id').unsigned().notNullable()
            table.string('token', 2048).notNullable()
            table.string('os', 128).notNullable()
            table.string('model', 255).notNullable()
            table.string('app_build', 255).notNullable()
            table.string('app_version', 255).notNullable()
            table.foreign('user_id')
                .references('users.id')
                .onDelete('CASCADE')
        })
        .createTable('project_api_keys', function(table) {
            table.increments()
            table.integer('project_id').unsigned().notNullable()
            table.string('value', 255).notNullable()
            table.string('name', 255).notNullable()
            table.string('description', 2048).nullable()
            table.timestamps()
            table.unique(['value'])
            table.foreign('project_id').references('projects.id').onDelete('CASCADE')
        })
}

exports.down = function(knex) {
    return knex.schema
        .dropTable('devices')
        .dropTable('users')
        .dropTable('project_admins')
        .dropTable('admins')
        .dropTable('project_api_keys')
        .dropTable('projects')
}