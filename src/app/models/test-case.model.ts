export interface TestCase {
  id: string;
  title: string;
  description: string;
  testSteps: string[];
  expectedResults: string[];
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed';
}

export interface TestCaseResponse {
  testCases: TestCase[];
  totalCount: number;
  domainId: string;
} 