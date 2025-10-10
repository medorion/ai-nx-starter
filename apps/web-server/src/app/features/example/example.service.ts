import { Injectable, NotFoundException } from '@nestjs/common';
import { ExampleDto } from '@monorepo-kit/types';

@Injectable()
export class ExampleService {
  private readonly examples: ExampleDto[] = [
    { id: '1', name: 'John Doe', age: 30, email: 'john.doe@example.com', tags: ['developer', 'frontend'] },
    { id: '2', name: 'Jane Smith', age: 28, email: 'jane.smith@example.com', tags: ['designer', 'ui/ux'] },
    { id: '3', name: 'Bob Johnson', age: 35, email: 'bob.johnson@example.com', tags: ['backend', 'database'] },
    { id: '4', name: 'Alice Williams', age: 32, email: 'alice.williams@example.com', tags: ['fullstack', 'react'] },
    { id: '5', name: 'Charlie Brown', age: 29, email: 'charlie.brown@example.com', tags: ['devops', 'aws'] },
    { id: '6', name: 'Diana Prince', age: 27, email: 'diana.prince@example.com', tags: ['mobile', 'ios'] },
    { id: '7', name: 'Edward Norton', age: 41, email: 'edward.norton@example.com', tags: ['architect', 'senior'] },
    { id: '8', name: 'Fiona Green', age: 26, email: 'fiona.green@example.com', tags: ['qa', 'automation'] },
    { id: '9', name: 'George Miller', age: 38, email: 'george.miller@example.com', tags: ['product', 'manager'] },
    { id: '10', name: 'Helen Davis', age: 33, email: 'helen.davis@example.com', tags: ['data', 'analytics'] },
    { id: '11', name: 'Ivan Petrov', age: 31, email: 'ivan.petrov@example.com', tags: ['security', 'backend'] },
    { id: '12', name: 'Julia Roberts', age: 29, email: 'julia.roberts@example.com', tags: ['frontend', 'vue'] },
    { id: '13', name: 'Kevin Hart', age: 34, email: 'kevin.hart@example.com', tags: ['mobile', 'android'] },
    { id: '14', name: 'Laura Wilson', age: 25, email: 'laura.wilson@example.com', tags: ['intern', 'javascript'] },
    { id: '15', name: 'Michael Scott', age: 42, email: 'michael.scott@example.com', tags: ['manager', 'sales'] },
    { id: '16', name: 'Nancy Drew', age: 28, email: 'nancy.drew@example.com', tags: ['detective', 'research'] },
    { id: '17', name: 'Oscar Martinez', age: 36, email: 'oscar.martinez@example.com', tags: ['accounting', 'finance'] },
    { id: '18', name: 'Pam Beesly', age: 30, email: 'pam.beesly@example.com', tags: ['reception', 'art'] },
    { id: '19', name: 'Quincy Jones', age: 45, email: 'quincy.jones@example.com', tags: ['music', 'producer'] },
    { id: '20', name: 'Rachel Green', age: 27, email: 'rachel.green@example.com', tags: ['fashion', 'retail'] },
    { id: '21', name: 'Steve Rogers', age: 39, email: 'steve.rogers@example.com', tags: ['leadership', 'team'] },
    { id: '22', name: 'Tony Stark', age: 43, email: 'tony.stark@example.com', tags: ['innovation', 'tech'] },
    { id: '23', name: 'Uma Thurman', age: 37, email: 'uma.thurman@example.com', tags: ['creative', 'director'] },
    { id: '24', name: 'Victor Hugo', age: 40, email: 'victor.hugo@example.com', tags: ['writer', 'content'] },
    { id: '25', name: 'Wendy Williams', age: 32, email: 'wendy.williams@example.com', tags: ['marketing', 'social'] },
    { id: '26', name: 'Xavier Charles', age: 48, email: 'xavier.charles@example.com', tags: ['professor', 'mentor'] },
    { id: '27', name: 'Yuki Tanaka', age: 26, email: 'yuki.tanaka@example.com', tags: ['designer', 'japanese'] },
    { id: '28', name: 'Zoe Clark', age: 24, email: 'zoe.clark@example.com', tags: ['junior', 'python'] },
    { id: '29', name: 'Adam Smith', age: 35, email: 'adam.smith@example.com', tags: ['economics', 'analysis'] },
    { id: '30', name: 'Betty White', age: 67, email: 'betty.white@example.com', tags: ['consultant', 'wisdom'] },
    { id: '31', name: 'Carl Jung', age: 52, email: 'carl.jung@example.com', tags: ['psychology', 'research'] },
    { id: '32', name: 'Dolly Parton', age: 58, email: 'dolly.parton@example.com', tags: ['entertainment', 'business'] },
    { id: '33', name: 'Elvis Presley', age: 44, email: 'elvis.presley@example.com', tags: ['music', 'performance'] },
    { id: '34', name: 'Frank Sinatra', age: 61, email: 'frank.sinatra@example.com', tags: ['classic', 'style'] },
    { id: '35', name: 'Grace Kelly', age: 33, email: 'grace.kelly@example.com', tags: ['elegance', 'class'] },
    { id: '36', name: 'Henry Ford', age: 55, email: 'henry.ford@example.com', tags: ['manufacturing', 'innovation'] },
    { id: '37', name: 'Iris West', age: 29, email: 'iris.west@example.com', tags: ['journalism', 'media'] },
    { id: '38', name: 'Jack Sparrow', age: 41, email: 'jack.sparrow@example.com', tags: ['adventure', 'freedom'] },
    { id: '39', name: 'Kate Middleton', age: 38, email: 'kate.middleton@example.com', tags: ['royal', 'charity'] },
    { id: '40', name: 'Leonardo DiCaprio', age: 46, email: 'leonardo.dicaprio@example.com', tags: ['actor', 'environment'] },
    { id: '41', name: 'Marie Curie', age: 34, email: 'marie.curie@example.com', tags: ['science', 'physics'] },
    { id: '42', name: 'Neil Armstrong', age: 47, email: 'neil.armstrong@example.com', tags: ['astronaut', 'pioneer'] },
    { id: '43', name: 'Oprah Winfrey', age: 65, email: 'oprah.winfrey@example.com', tags: ['media', 'inspiration'] },
    { id: '44', name: 'Pablo Picasso', age: 39, email: 'pablo.picasso@example.com', tags: ['art', 'creativity'] },
    { id: '45', name: 'Queen Elizabeth', age: 72, email: 'queen.elizabeth@example.com', tags: ['leadership', 'tradition'] },
    { id: '46', name: 'Robin Williams', age: 51, email: 'robin.williams@example.com', tags: ['comedy', 'heart'] },
    { id: '47', name: 'Serena Williams', age: 37, email: 'serena.williams@example.com', tags: ['sports', 'champion'] },
    { id: '48', name: 'Thomas Edison', age: 44, email: 'thomas.edison@example.com', tags: ['inventor', 'electricity'] },
    { id: '49', name: 'Usain Bolt', age: 33, email: 'usain.bolt@example.com', tags: ['speed', 'athletics'] },
    { id: '50', name: 'Vincent Van Gogh', age: 31, email: 'vincent.vangogh@example.com', tags: ['artist', 'passion'] },
  ];

  private nextId = 51;

  /**
   * Get all examples
   */
  findAll(): ExampleDto[] {
    return this.examples;
  }

  /**
   * Get example by ID
   */
  findOne(id: string): ExampleDto {
    const example = this.examples.find((item) => item.id === id);
    if (!example) {
      throw new NotFoundException(`Example with ID ${id} not found`);
    }
    return example;
  }

  /**
   * Create new example
   */
  create(exampleData: Omit<ExampleDto, 'id'>): ExampleDto {
    const newExample: ExampleDto = {
      id: this.nextId.toString(),
      ...exampleData,
    };

    this.examples.push(newExample);
    this.nextId++;

    return newExample;
  }

  /**
   * Update existing example
   */
  update(id: string, updateData: Partial<ExampleDto>): ExampleDto {
    const index = this.examples.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`Example with ID ${id} not found`);
    }

    const updatedExample = {
      ...this.examples[index],
      ...updateData,
      id, // Ensure ID cannot be changed
    };

    this.examples[index] = updatedExample;
    return updatedExample;
  }

  /**
   * Delete example
   */
  remove(id: string): void {
    const index = this.examples.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`Example with ID ${id} not found`);
    }

    this.examples.splice(index, 1);
  }

  /**
   * Filter examples by name (case-insensitive)
   */
  findByName(name: string): ExampleDto[] {
    const searchTerm = name.toLowerCase();
    return this.examples.filter((example) => example.name.toLowerCase().includes(searchTerm));
  }

  /**
   * Get examples count
   */
  count(): number {
    return this.examples.length;
  }
}
