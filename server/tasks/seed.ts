export default defineTask({
	meta: {
		name: 'db:seed',
		description: 'Run database seed task',
	},
	async run() {
		console.info('Running DB seed task...');

		// Check if the tables are already seeded
		const apartmentsDatabase = await useDrizzle()
			.select()
			.from(tables.apartments)
			.all();
		if (apartmentsDatabase.length === 0) {
			const apartments = [
				{
					street: 'Hibiscusvej',
					number: '2',
					floor: null,
					door: null,
				},
				{
					street: 'Hibiscusvej',
					number: '4',
					floor: null,
					door: null,
				},
				{
					street: 'Hibiscusvej',
					number: '6',
					floor: null,
					door: null,
				},
				{
					street: 'Hibiscusvej',
					number: '8',
					floor: null,
					door: null,
				},
				{
					street: 'Hibiscusvej',
					number: '10',
					floor: null,
					door: null,
				},
				{
					street: 'Hibiscusvej',
					number: '12',
					floor: null,
					door: null,
				},
				{
					street: 'Hibiscusvej',
					number: '14',
					floor: null,
					door: null,
				},
				{
					street: 'Hibiscusvej',
					number: '16',
					floor: null,
					door: null,
				},
				{
					street: 'Hibiscusvej',
					number: '18',
					floor: null,
					door: null,
				},
				{
					street: 'Hibiscusvej',
					number: '24',
					floor: null,
					door: null,
				},
				{
					street: 'Hibiscusvej',
					number: '26',
					floor: null,
					door: null,
				},
				{
					street: 'Hibiscusvej',
					number: '28',
					floor: null,
					door: null,
				},
				{
					street: 'Hibiscusvej',
					number: '30',
					floor: null,
					door: null,
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '1',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '2',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '3',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '4',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '5',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '6',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '7',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '8',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '9',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '10',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '11',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '12',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '13',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '14',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '15',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '16',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '17',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '1',
					door: '18',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '1',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '2',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '3',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '4',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '5',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '6',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '7',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '8',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '9',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '10',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '11',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '12',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '13',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '14',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '15',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '16',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '17',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '2',
					door: '18',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '1',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '2',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '3',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '4',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '5',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '6',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '7',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '8',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '9',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '10',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '11',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '12',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '13',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '14',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '15',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '16',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '17',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '3',
					door: '18',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '1',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '2',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '3',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '4',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '5',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '6',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '7',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '8',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '9',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '10',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '11',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '12',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '13',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '14',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '15',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '16',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '17',
				},
				{
					street: 'Hibiscusvej',
					number: '20',
					floor: '4',
					door: '18',
				},
			];

			for (let i = 0; i < apartments.length; i += 20) {
				await useDrizzle()
					.insert(tables.apartments)
					.values(apartments.slice(i, i + 20))
					.get();
			}
			console.info('Apartments seeded');
		}
		return { result: 'success' };
	},
});
