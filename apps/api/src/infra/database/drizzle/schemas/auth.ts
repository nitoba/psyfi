import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const userRolesEnum = pgEnum('user_roles', ['patient', 'psychologist'])

export const users = pgTable('users', {
  id: uuid('id').notNull().primaryKey().defaultRandom(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  role: userRolesEnum('role').notNull(),
})

type AccountType = 'email' | 'oidc' | 'oauth' | 'webauthn'

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
  },
  (accounts) => ({
    compoundKey: primaryKey({
      columns: [accounts.provider, accounts.providerAccountId],
    }),
  }),
)
