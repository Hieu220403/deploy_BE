import { faker } from '@faker-js/faker'
import restaurantsServices from '~/services/restaurants.services'
export async function seedUsers() {
  try {
    for (let i = 0; i < 100; i++) {
      await restaurantsServices.create({
        name: faker.company.name(),
        avatar: faker.image.avatar(),
        description: faker.lorem.paragraph(),
        address: faker.location.streetAddress(),
        phone_number: faker.phone.number()
      })
    }
  } catch (err) {
    console.error(err)
  }
}


