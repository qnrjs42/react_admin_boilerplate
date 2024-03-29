import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useToast } from '@shadcn-ui/hooks';

import apiAuthLogin from '@features/auth/apis/login';

import { AUTH_KEYS } from '@entities/auth/consts';
import { LoginFormDtoSchema } from '@entities/auth/contracts';
import type { LoginFormDto } from '@entities/auth/types';

import { utilAxiosError } from '@utils/utilAxios';

import useMeStore from '@stores/me';

import { TOAST_DURATION } from '@src/shared/consts/common';
import { ROUTE_PATHS } from '@src/shared/consts/routes';
import { STORAGE_KEYS } from '@src/shared/consts/storage';

const useAuthLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const setMe = useMeStore(state => state.setMe);

  const { mutate: login } = useMutation({
    mutationKey: [AUTH_KEYS.LOGIN],
    mutationFn: apiAuthLogin,
    onSuccess: newMe => {
      localStorage.setItem(STORAGE_KEYS.AUTHORIZATION, newMe.authorization);
      setMe(newMe);

      navigate(ROUTE_PATHS.ADMIN.BANNERS.ALL_LIST, { replace: true });
    },
    onError: error => {
      toast({
        variant: 'destructive',
        title: '로그인 실패했습니다.',
        description: utilAxiosError(error),
        duration: TOAST_DURATION.ERROR,
      });
    },
  });

  const form = useForm<LoginFormDto>({
    resolver: zodResolver(LoginFormDtoSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = form.handleSubmit((data: LoginFormDto): void => {
    login(data);
  });

  return { form, onSubmit };
};

export default useAuthLogin;
