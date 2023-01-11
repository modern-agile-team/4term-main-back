export const SwaggerApiResponse: any = {
  success: (description: string, msg: string, response?: any) => {
    const example = {
      success: true,
      msg,
      response,
    };

    return {
      description,
      schema: {
        example,
      },
    };
  },
};
