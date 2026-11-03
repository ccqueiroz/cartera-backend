// ponytail: reads the four TypeScript enums as text; a member that is not a quoted literal exits 1; move to ts-node if an enum stops being a literal.
const fs = require('node:fs');
const path = require('node:path');

process.chdir(path.resolve(__dirname, '..'));

const failures = [];
const fail = (message) => void failures.push(message);

const enums = [
  {
    schema: 'CategoryDescriptionEnum',
    declaration: 'CategoryDescriptionEnum',
    file: 'src/features/category/domain/enums/category-description.enum.ts',
    description: 'Enumeração da descrição da categoria.',
  },
  {
    schema: 'CategoryGroupEnum',
    declaration: 'CategoryGroupEnum',
    file: 'src/features/category/domain/enums/category-group.enum.ts',
    description: 'Grupo da categoria.',
  },
  {
    schema: 'PaymentMethodDescriptionEnum',
    declaration: 'PaymentMethodDescriptionEnum',
    file: 'src/features/payment-method/domain/enums/payment-method-description.enum.ts',
    description: 'Enumeração das descrições dos métodos de pagamento.',
  },
  {
    schema: 'PaymentStatusDescriptionEnum',
    declaration: 'PaymentStatusEnum',
    file: 'src/shared/kernel/enums/payment-status.enum.ts',
    description: 'Enumeração das descrições dos status de pagamento.',
  },
];

const memberPattern = /^\s*(?:'[^']+'|[A-Za-z_]\w*)\s*[:=]\s*'([^']*)',?\s*$/;
const yamlValue = (value) => (/^[A-Za-z_]/.test(value) ? value : `'${value}'`);

const readValues = ({ file, declaration }) => {
  if (!fs.existsSync(file)) return fail(`file not read: ${file}`);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const start = lines.findIndex((line) =>
    new RegExp(
      `^export (const ${declaration} = \\{|enum ${declaration} \\{)$`,
    ).test(line),
  );
  if (start < 0) return fail(`declaration not found: ${file}`);
  const values = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\} ?(as const)?;?$/.test(line)) {
      if (!values.length) return fail(`no members: ${file}`);
      return values;
    }
    if (!line.trim()) continue;
    const value = line.match(memberPattern)?.[1];
    if (value === undefined)
      return fail(`member not a quoted literal: ${file}: ${line.trim()}`);
    values.push(value);
  }
  return fail(`closing line not found: ${file}`);
};

const schemaBlocks = enums.map((entry) => {
  const values = readValues(entry);
  if (!values) return [];
  return [
    `     ${entry.schema}:`,
    '       type: string',
    `       description: ${entry.description}`,
    '       enum:',
    ...values.map((value) => `         - ${yamlValue(value)}`),
    `       example: ${yamlValue(values[0])}`,
  ];
});

if (failures.length) {
  failures.forEach((message) => console.error(message));
  process.exit(1);
}

const body = schemaBlocks
  .flatMap((block, index) => (index ? ['', ...block] : block))
  .map((line) => (line ? ` *${line}` : ' *'));
const header = '/**\n * @swagger\n * components:\n *   schemas:\n';
fs.writeFileSync(
  'src/shared/http/swagger/schemas.swagger.ts',
  `${header}${body.join('\n')}\n */\nexport {};\n`,
);
