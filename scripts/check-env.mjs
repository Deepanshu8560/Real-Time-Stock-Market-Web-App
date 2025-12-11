import 'dotenv/config';

console.log('🔍 Checking environment variables...\n');

const requiredVars = {
    'DATABASE_URL': {
        required: true,
        description: 'PostgreSQL connection string (Neon or other provider)',
        example: 'postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require'
    },
    'BETTER_AUTH_SECRET': {
        required: true,
        description: 'Secret key for Better Auth',
        example: 'generate-a-random-secret-key-here'
    },
    'BETTER_AUTH_URL': {
        required: true,
        description: 'Base URL for Better Auth',
        example: 'http://localhost:3000'
    }
};

let hasErrors = false;

for (const [varName, config] of Object.entries(requiredVars)) {
    const value = process.env[varName];
    
    if (!value || value.trim() === '') {
        if (config.required) {
            console.error(`❌ ${varName}: MISSING (required)`);
            console.error(`   Description: ${config.description}`);
            console.error(`   Example: ${config.example}\n`);
            hasErrors = true;
        } else {
            console.warn(`⚠️  ${varName}: Not set (optional)`);
        }
    } else {
        // Validate DATABASE_URL format
        if (varName === 'DATABASE_URL') {
            const trimmed = value.trim();
            if (!trimmed.startsWith('postgres://') && !trimmed.startsWith('postgresql://') && !trimmed.startsWith('postgresql+neon://')) {
                console.error(`❌ ${varName}: INVALID FORMAT`);
                console.error(`   Current value: "${trimmed.substring(0, 50)}${trimmed.length > 50 ? '...' : ''}"`);
                console.error(`   Must start with "postgres://", "postgresql://", or "postgresql+neon://"`);
                console.error(`   Example: ${config.example}\n`);
                hasErrors = true;
            } else {
                // Mask password in connection string for display
                const masked = trimmed.replace(/:([^:@]+)@/, ':***@');
                console.log(`✅ ${varName}: Set (${trimmed.length} chars)`);
                console.log(`   Preview: ${masked.substring(0, 80)}${masked.length > 80 ? '...' : ''}\n`);
            }
        } else {
            // Mask sensitive values
            const displayValue = varName.includes('SECRET') || varName.includes('PASSWORD') || varName.includes('KEY')
                ? '***' + value.slice(-4)
                : value;
            console.log(`✅ ${varName}: Set`);
            console.log(`   Value: ${displayValue}\n`);
        }
    }
}

if (hasErrors) {
    console.error('\n❌ Some required environment variables are missing or invalid.');
    console.error('Please check your .env file in the root directory.\n');
    process.exit(1);
} else {
    console.log('✅ All required environment variables are set!\n');
    process.exit(0);
}

