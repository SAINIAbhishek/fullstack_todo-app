import './task-item.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarCheck,
  faCalendarDays,
  faStar,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { formattedDate } from '@/utils/date';
import IconBtn from '@/components/buttons/icon-btn';
import { useMutation } from 'react-query';
import { API_DELETE_TASK } from '@/api/task.api';
import toast from 'react-hot-toast';
import { queryClient } from '@/lib/react-query';

type Props = {
  task: TaskType;
  queryKey: string;
};

const TaskItem = ({ task, queryKey }: Props) => {
  const { mutate: deleteMutate, isLoading: isDeleting } = useMutation(
    API_DELETE_TASK,
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries(queryKey).then();
        toast.success(response.message);
      },
      onError: (err: Error) => {
        toast.error(err.message);
      },
    },
  );

  return (
    <div className="task-item__card">
      <h5 className="mb-2 font-bold tracking-tight text-white">{task.title}</h5>
      <p className="mb-8 font-normal text-gray-400">{task.description}</p>
      <div className="mt-auto text-gray-300 flex w-full items-center">
        <FontAwesomeIcon icon={faCalendarDays} className="mr-3" />
        {formattedDate(task.date)}
      </div>
      <div className="task-item__footer">
        <IconBtn
          title={task.important ? 'mark as uncompleted' : 'mark as completed'}
          className={`hover:bg-gray-700 ${
            task.important
              ? 'text-green-500 hover:text-green-600'
              : 'text-white'
          }`}>
          <FontAwesomeIcon icon={faCalendarCheck} />
        </IconBtn>
        <IconBtn
          title={task.important ? 'unmark as important' : 'mark as important'}
          className={`hover:bg-gray-700 ${
            task.important ? 'text-red-500 hover:text-red-600' : 'text-white'
          }`}>
          <FontAwesomeIcon icon={faStar} />
        </IconBtn>
        <IconBtn
          handleClick={() => deleteMutate(task._id)}
          isDisabled={isDeleting}
          title="Delete task"
          className="text-white hover:bg-gray-700">
          <FontAwesomeIcon icon={faTrashCan} />
        </IconBtn>
      </div>
      <span
        className={`task-item__badge ${
          task.completed
            ? 'bg-green-200 text-green-800'
            : 'bg-yellow-200 text-yellow-800'
        }`}>
        {task.completed ? 'Completed' : 'Uncompleted'}
      </span>
    </div>
  );
};

export default TaskItem;
