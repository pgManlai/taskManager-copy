import { TaskList } from "@/components/tasks/task-list";

export default function Trash() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Trash</h1>
        <p className="mt-1 text-sm text-gray-500">View and restore deleted tasks</p>
      </div>
      
      <TaskList title="Deleted Tasks" isTrashView={true} />
    </div>
  );
}
